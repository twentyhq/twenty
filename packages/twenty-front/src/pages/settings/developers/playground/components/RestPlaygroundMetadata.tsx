import Playground from '@/settings/api/playground/components/Playground';
import { RestApiWrapper } from '@/settings/api/playground/components/RestApiWrapper';
import { useState } from 'react';

const RestPlaygroundMetadata = () => {
  const [openApiJson, setOpenApiJson] = useState<{}>();

  const children = <RestApiWrapper openApiJson={openApiJson} />;

  return (
    <Playground
      children={children}
      setOpenApiJson={setOpenApiJson}
      subDoc="metadata"
    />
  );
};

export default RestPlaygroundMetadata;
