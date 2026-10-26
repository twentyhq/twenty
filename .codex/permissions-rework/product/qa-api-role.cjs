const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { api, login } = require('./local-api.cjs');
const report = { checks: [], startedAt: new Date().toISOString() };
const save=()=>writeFileSync('.codex/permissions-rework/product/qa-api-role-results.json',JSON.stringify(report,null,2));
(async()=>{
 const administrator=await login(); const expiresAt=new Date(Date.now()+3600000).toISOString(); const companyId=randomUUID();
 const created=await api('mutation($input:CreateApiKeyInput!){createApiKey(input:$input){id}}',{input:{name:'Disposable permission QA key',expiresAt,roleId:'8daf8b8b-9ffb-48a2-ac02-499b3fe59206'}},administrator);
 const apiKeyId=created.createApiKey.id; report.apiKeyId=apiKeyId; let companyCreated=false;
 try {
  const generated=await api('mutation($apiKeyId:UUID!,$expiresAt:String!){generateApiKeyToken(apiKeyId:$apiKeyId,expiresAt:$expiresAt){token}}',{apiKeyId,expiresAt},administrator);
  const token=generated.generateApiKeyToken.token;
  const core=(query,variables)=>api(query,variables,token,'graphql');
  await core('mutation($data:CompanyCreateInput!){createCompany(data:$data){id}}',{data:{id:companyId,name:'Disposable API role QA company'}});companyCreated=true;
  assert.equal((await core('query($id:UUID!){company(filter:{id:{eq:$id}}){id}}',{id:companyId})).company.id,companyId);
  await assert.rejects(()=>core('query($id:UUID!){company(filter:{id:{eq:$id}}){id linkedinLink{primaryLinkUrl}}}',{id:companyId}),/FORBIDDEN/);
  report.checks.push('API role authorizes creation and live reads while field restrictions remain restrictive');
  await api('mutation($key:UUID!,$role:UUID!){assignRoleToApiKey(apiKeyId:$key,roleId:$role)}',{key:apiKeyId,role:'dd8b9d96-4a15-4cec-af2b-b0288428de69'},administrator);
  const read=await core('query($id:UUID!){company(filter:{id:{eq:$id}}){id}}',{id:companyId}); assert.equal(read.company.id,companyId);
  await assert.rejects(()=>core('mutation($id:UUID!){updateCompany(id:$id,data:{name:"Unauthorized edit"}){id}}',{id:companyId}),/FORBIDDEN|NOT_FOUND/);
  await assert.rejects(()=>core('mutation($id:UUID!){destroyCompany(id:$id){id}}',{id:companyId}),/FORBIDDEN|NOT_FOUND/);
  report.checks.push('Changing the API role immediately revokes update and destroy while retaining its new read grant');
  await api('mutation($input:RevokeApiKeyInput!){revokeApiKey(input:$input){id}}',{input:{id:apiKeyId}},administrator);
  await assert.rejects(()=>core('query($id:UUID!){company(filter:{id:{eq:$id}}){id}}',{id:companyId}),/UNAUTHENTICATED|UNAUTHORIZED|revoked|expired/i);
  report.checks.push('Revoked API key cannot read');
 } finally {
  await api('mutation($input:RevokeApiKeyInput!){revokeApiKey(input:$input){id}}',{input:{id:apiKeyId}},administrator);
  if(companyCreated) await api('mutation($id:UUID!){destroyCompany(id:$id){id}}',{id:companyId},administrator,'graphql');
  report.keyRevoked=true; report.testRecordRemoved=true; save();
 }
 report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify(report,null,2));
})().catch(error=>{report.error=error.message;save();console.error(error.message);process.exitCode=1;});
