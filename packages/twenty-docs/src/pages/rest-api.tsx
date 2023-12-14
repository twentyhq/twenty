import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React from "react";
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';

const RestApiComponent = () => {
  return (
    <div className="App">
      <API
        apiDescriptionUrl="https://raw.githubusercontent.com/stoplightio/Public-APIs/master/reference/zoom/openapi.yaml"
      />
    </div>
  )
}

const restApi = () => (
  <Layout
    title="REST API Playground"
    description="REST API Playground for Twenty"
  >
    <BrowserOnly>{() => <RestApiComponent />}</BrowserOnly>
  </Layout>
);

export default restApi;
