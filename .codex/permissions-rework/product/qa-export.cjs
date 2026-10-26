const assert = require('node:assert/strict');
const { createClient } = require('graphql-sse');
const { writeFileSync } = require('node:fs');
const { api, login } = require('./local-api.cjs');
const { setTimeout: delay } = require('node:timers/promises');
const report={checks:[],startedAt:new Date().toISOString()};
const save=()=>writeFileSync(process.argv.includes('--activate-policy') ? '.codex/permissions-rework/product/qa-export-activation-results.json' : '.codex/permissions-rework/product/qa-export-results.json',JSON.stringify(report,null,2));
(async()=>{
 const token=await login();
 const metadata=await api('query($id:UUID!){object(id:$id){id fields(paging:{first:100}){edges{node{id name}}}}}',{id:'73f9b3ba-12da-4308-838f-50be081dff6a'},token);
 const input={objectMetadataId:metadata.object.id,fieldMetadataIds:['id','name'].map(name=>metadata.object.fields.edges.find(e=>e.node.name===name).node.id),filter:{id:{eq:'20202020-a305-41e7-8c72-ba44072a4c58'}}};
 const exportFile=async(parameters=input)=>{
  const connection=createClient({url:'http://localhost:3000/metadata',headers:{Authorization:`Bearer ${token}`,Origin:'http://localhost:3001'},retryAttempts:0});
  const timer=setTimeout(()=>connection.dispose(),120000);
  try {
   const events=connection.iterate({query:'subscription($input:CreateRecordExportInput!){exportRecords(input:$input){id progress downloadPath errorMessage}}',variables:{input:parameters}});
   for await(const event of events){if(event.errors)throw new Error(JSON.stringify(event.errors));const output=event.data.exportRecords;if(output.errorMessage)throw new Error(output.errorMessage);if(output.downloadPath)return output;}
   throw new Error('Export ended before completing');
  }finally{clearTimeout(timer);connection.dispose();}
 };
 const file=await exportFile();
 const download=await fetch(`http://localhost:3000${file.downloadPath}`,{headers:{Authorization:`Bearer ${token}`,Origin:'http://localhost:3001'}});assert.equal(download.status,200);const csv=await download.text();assert.match(csv,/Google/);assert.match(csv,/20202020-a305-41e7-8c72-ba44072a4c58/);assert.equal(csv.trim().split('\n').length,2);report.checks.push('SSE export completes with the projected authorized row; authenticated CSV download has exactly one data row');
 const forbiddenInput={...input,fieldMetadataIds:[metadata.object.fields.edges.find(e=>e.node.name==='linkedinLink').node.id]};
 await assert.rejects(()=>exportFile(forbiddenInput),/permission|FORBIDDEN/i);report.checks.push('Restricted field cannot be exported');
 if(process.argv.includes('--activate-policy')){
  const oldFile=await exportFile();
  const state=(await api('{recordPermissionPolicy}',{},token)).recordPermissionPolicy;
  assert.equal(state.candidateRevisionId,null);
  const published=(await api('mutation($definition:JSON!,$expected:UUID){publishRecordPermissionPolicy(definition:$definition,expectedActiveRevisionId:$expected)}',{definition:state.definition,expected:state.activeRevisionId},token)).publishRecordPermissionPolicy;
  report.candidateId=published.candidateRevisionId;save();
  try {
   let active;
   for(let i=0;i<180;i++){const current=(await api('{recordPermissionPolicy}',{},token)).recordPermissionPolicy;if(current.status==='failed')throw new Error(current.failureReason);if(current.activeRevisionId===published.candidateRevisionId){active=current;break;}await delay(1000);}
   assert.ok(active,'Identical policy candidate must activate');
   const stale=await fetch(`http://localhost:3000${oldFile.downloadPath}`,{headers:{Authorization:`Bearer ${token}`,Origin:'http://localhost:3001'}});assert.equal(stale.status,403);report.checks.push('Activating a new policy invalidates an already completed export before download');report.activeRevisionId=active.activeRevisionId;
  }finally{const current=(await api('{recordPermissionPolicy}',{},token)).recordPermissionPolicy;if(current.candidateRevisionId===published.candidateRevisionId)await api('mutation($id:UUID!){cancelRecordPermissionPolicy(revisionId:$id)}',{id:published.candidateRevisionId},token);}
 }
 report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify(report,null,2));
})().catch(error=>{report.error=error.message;save();console.error(error.message);process.exitCode=1;});
