import { playgroundApiToken } from "@/activities/states/playgroundApiToken";
import { playgroundOpenapiJson } from "@/activities/states/playgroundOpenapiJson";
import { AppPath } from "@/types/AppPath";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import GraphQlPlayground from "~/pages/settings/playground/graphql-playground";
import { RestApiWrapper } from "~/pages/settings/playground/rest-api-wrapper";


export const Playground = () => {  
const {type} = useParams();
const [searchParams] = useSearchParams();
const [baseurl, subdoc] = [searchParams.get('baseurl'), searchParams.get('subdoc') || 'core'];
const [token] = useRecoilState(playgroundApiToken);
const [openApiJson] = useRecoilState(playgroundOpenapiJson)
const allowedSubdocs = ['core', 'metadata'];
if (!baseurl || !token || !subdoc || !allowedSubdocs.includes(subdoc)) {
    return <Navigate to={AppPath.Index} />;
  
}
if(type === 'graphql') {
  return <GraphQlPlayground baseurl={decodeURIComponent(baseurl)} subdoc={subdoc} token={token} />

}else if(type === 'rest' && openApiJson) {
  return <RestApiWrapper openApiJson={openApiJson} baseurl={decodeURIComponent(baseurl)} subdoc={subdoc} token={token} />
}else{
    return <Navigate to={AppPath.Index} />
}
}