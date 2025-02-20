import { authCheckerInput, LaunchHandlerInput } from "~/types/ApiAuth";




export const useApikeyAuth = () => {
    //just return the promise, the client will handle the rest
    const authChecker =  async ({apikey, baseurl, schemaType} : authCheckerInput) => {
        return fetch(baseurl + '/open-api/' + schemaType, {
            headers: { Authorization: `Bearer ${apikey}` },
          })
    
    }



    //this function handles the steps involved after receivving the response from client, from error catching to redirecting
          const LaunchHandler = async({authChecker, navigate, beginLoading, stopLoading, setInvalidToken, setGlobalApiToken, setOpenapiJson, apikey, apitype, baseurl, schemaType} : LaunchHandlerInput) => {
            //first start loading
          beginLoading();
          //now auth the api
          try {
            const authresponse = await authChecker({apikey, baseurl, schemaType});
            // once recieved the response, update the global state to reflect apijsoncontent and apikey
           let apijsoncontent = await authresponse.json();
            if(!apijsoncontent.tags){
              throw new Error("Invalid Token")
            }


            //update the states
            setInvalidToken("");
            setGlobalApiToken(apikey)
            setOpenapiJson(apijsoncontent)

            //finally, redirect
            navigate(`/playground/${apitype}?baseurl=${encodeURIComponent(baseurl)}&subdoc=${schemaType}`)

          }catch(e: any){
            setInvalidToken(e.toString());
          }finally{
            stopLoading()
          }
    
          }
    

    return {authChecker, LaunchHandler}
}