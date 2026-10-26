const fs = require('node:fs');
const origin = 'http://localhost:3001';
async function api(query, variables = {}, token, endpoint = 'metadata') {
  const response = await fetch(`http://localhost:3000/${endpoint}`, {method:'POST',headers:{'content-type':'application/json',Origin:origin,...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({query,variables})});
  const result = await response.json();
  if(result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}
async function login(email = 'tim@apple.dev') {
 const first = await api('mutation($email:String!,$password:String!,$origin:String!){getLoginTokenFromCredentials(email:$email,password:$password,origin:$origin){loginToken{token}}}',{email,password:'tim@apple.dev',origin});
 const second = await api('mutation($token:String!,$origin:String!){getAuthTokensFromLoginToken(loginToken:$token,origin:$origin){tokens{accessOrWorkspaceAgnosticToken{token}}}}',{token:first.getLoginTokenFromCredentials.loginToken.token,origin});
 return second.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken.token;
}
module.exports = {api,login};
if(require.main===module) (async()=>{
 const token=await login();
 for(const featureFlag of ['IS_RECORD_PERMISSION_POLICIES_ENABLED','IS_ROW_LEVEL_SECURITY_ENABLED','IS_RECORD_LEVEL_SHARING_ENABLED']) {
  await api('mutation($workspaceId:UUID!,$featureFlag:String!){updateWorkspaceFeatureFlag(workspaceId:$workspaceId,featureFlag:$featureFlag,value:true)}',{workspaceId:'20202020-1c25-4d02-bf25-6aeccf7ea419',featureFlag},token,'admin-panel');
 }
 const state=await api('{recordPermissionPolicy}',{},token);
 fs.writeFileSync('.codex/permissions-rework/product/initial-policy.json',JSON.stringify(state.recordPermissionPolicy,null,2));
 console.log({status:state.recordPermissionPolicy.status, objects:state.recordPermissionPolicy.definition.objects.length});
})().catch(error=>{console.error(error.message);process.exitCode=1});
