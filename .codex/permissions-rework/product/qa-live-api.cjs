const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');
const { api, login } = require('./local-api.cjs');
const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const companyId = '20202020-a305-41e7-8c72-ba44072a4c58';
const noteObjectId = '8bafe866-54df-4f1f-9a8e-0940b90e659f';
const memberId = '20202020-77d5-4cb6-b60a-f4a835a85d61';
const noteId = randomUUID();
let targetId = randomUUID();
const flags = ['IS_RECORD_PERMISSION_POLICIES_ENABLED', 'IS_ROW_LEVEL_SECURITY_ENABLED', 'IS_RECORD_LEVEL_SHARING_ENABLED'];
const report = { noteId, startedAt: new Date().toISOString(), checks: [] };
const save = () => writeFileSync('.codex/permissions-rework/product/qa-live-api-results.json', JSON.stringify(report, null, 2));
(async () => {
  const administrator = await login();
  const member = await login('jony.ive@apple.dev');
  const state = (await api('{recordPermissionPolicy}', {}, administrator)).recordPermissionPolicy;
  let created = false;
  let linked = false;
  const core = (query, variables, token = administrator) => api(query, variables, token, 'graphql');
  const point = (token) => core('query($id: UUID!){note(filter:{id:{eq:$id}}){id}}', {id: noteId}, token);
  const list = (token) => core('query($id: UUID!){notes(filter:{id:{eq:$id}}){totalCount edges{node{id}}}}', {id: noteId}, token);
  const setFlag = (featureFlag, value) => api('mutation($workspaceId:UUID!,$featureFlag:String!,$value:Boolean!){updateWorkspaceFeatureFlag(workspaceId:$workspaceId,featureFlag:$featureFlag,value:$value)}', {workspaceId, featureFlag, value}, administrator, 'admin-panel');
  const expectDenied = async (work) => { await assert.rejects(work, /NOT_FOUND|FORBIDDEN|not found|permission/i); };
  const link = async () => { targetId = randomUUID(); await core('mutation($data:NoteTargetCreateInput!){createNoteTarget(data:$data){id}}', {data:{id:targetId,noteId,targetCompanyId:companyId}}); linked=true; };
  const unlink = async () => { await core('mutation($id:UUID!){destroyNoteTarget(id:$id){id}}', {id:targetId}); linked=false; };
  const target = { objectMetadataId:noteObjectId, recordId:noteId };
  const principal = { workspaceMemberId:memberId };
  const share = (token=administrator) => api('mutation($target:RecordTargetInput!,$principal:RecordSharePrincipalInput!){setRecordShare(target:$target,principal:$principal,accessLevel:READ){usesRecordPermissionPolicy}}', {target,principal}, token);
  try {
    await core('mutation($data:NoteCreateInput!){createNote(data:$data){id}}', {data:{id:noteId,title:'Permission QA disposable private note'}});
    created=true;
    await expectDenied(()=>point(administrator));
    await expectDenied(()=>point(member));
    assert.equal((await list(member)).notes.totalCount,0);
    report.checks.push('Private by default; creator receives no implicit grant; private collection/count is empty');
    for(const flag of flags) await setFlag(flag,false);
    await expectDenied(()=>point(member));
    assert.equal((await list(member)).notes.totalCount,0);
    await assert.rejects(()=>api('mutation($definition:JSON!,$expected:UUID){publishRecordPermissionPolicy(definition:$definition,expectedActiveRevisionId:$expected)}',{definition:state.definition,expected:state.activeRevisionId},administrator),/not enabled/);
    report.checks.push('Disabling all authoring flags preserves active enforcement and blocks publication');
    for(const flag of flags) await setFlag(flag,true);
    await link();
    assert.equal((await point(member)).note.id,noteId);
    await expectDenied(()=>share(member));
    await share();
    await unlink();
    assert.equal((await point(member)).note.id,noteId);
    await expectDenied(()=>point(administrator));
    report.checks.push('Inherited read works live; a member without Share cannot delegate; explicit grants survive grantor access loss');
    await link();
    await api('mutation($target:RecordTargetInput!,$principal:RecordSharePrincipalInput!){removeRecordShare(target:$target,principal:$principal){usesRecordPermissionPolicy}}',{target,principal},administrator);
    assert.equal((await point(member)).note.id,noteId);
    await unlink();
    await expectDenied(()=>point(member));
    report.checks.push('Removing a direct grant preserves inheritance; removing its final parent denies point reads immediately');
    const response = await fetch(`http://localhost:3000/rest/notes/${noteId}`,{headers:{Authorization:`Bearer ${member}`,Origin:'http://localhost:3001'}});
    assert.equal(response.status,404);
    report.checks.push('REST point read also denies the unshared private record');
    let remaining;
    for(let attempt=0;attempt<30;attempt++) { remaining=(await list(member)).notes.totalCount; if(remaining===0)break; await delay(1000); }
    assert.equal(remaining,0);
    report.checks.push('Projected collection and exact count converge to the live revocation');
    assert.equal((await api('{recordPermissionPolicy}',{},administrator)).recordPermissionPolicy.activeRevisionId,state.activeRevisionId);
    report.checks.push('Active policy identity is unchanged');
  } finally {
    for(const flag of flags) await setFlag(flag,true);
    if(created) { if(!linked)await link(); await core('mutation($id:UUID!){destroyNote(id:$id){id}}',{id:noteId}); created=false; }
    if(linked) { try { await unlink(); } catch(error) { if(!/not found|NOT_FOUND/i.test(error.message))throw error; } }
    report.cleanedUp=true;
    save();
  }
  report.finishedAt=new Date().toISOString(); save(); console.log(JSON.stringify(report,null,2));
})().catch(error=>{report.error=error.message;save();console.error(error.message);process.exitCode=1;});
