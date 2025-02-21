import Playground from '@/settings/api/playground/playgrounds/playground';
import { RestApiWrapper } from '@/settings/api/playground/playgrounds/rest-api-wrapper';
import { useEffect, useState } from 'react';

const RestPlaygroundCore = () => {
  const [openApiJson, setOpenApiJson] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) { 
    return null;
  }

  const children = <RestApiWrapper openApiJson={openApiJson} />;

  return (
    <div style={{ width: '100vw' }}>
      <Playground
        children={children}
        setOpenApiJson={setOpenApiJson}
        subDoc="core"
      />
    </div>
  );
};

export default RestPlaygroundCore;
