import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useEffect, useState } from "react";
import Playground from "../components/playground";
import spotlightTheme from '!css-loader!@stoplight/elements/styles.min.css';
import { API } from "@stoplight/elements";


const restApi = () => {
  const [openApiJson, setOpenApiJson] = useState({})

  const RestApi = (
    <API
      apiDescriptionDocument={JSON.stringify(openApiJson)}
      router="hash"
    />
  )

  // We load spotlightTheme style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = spotlightTheme.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    <Layout
      title="REST API Playground"
      description="REST API Playground for Twenty"
    >
      <BrowserOnly>{
        () => <Playground
          children={RestApi}
          setOpenApiJson={setOpenApiJson}
        />
      }</BrowserOnly>
    </Layout>
  )
};

export default restApi;
