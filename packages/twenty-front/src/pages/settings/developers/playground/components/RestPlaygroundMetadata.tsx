import Playground from '@/settings/api/playground/components/Playground';
import { RestApiWrapper } from '@/settings/api/playground/components/RestApiWrapper';
import { useState } from 'react';

const RestPlaygroundMetadata = () => {
  const [openApiJson, setOpenApiJson] = useState<object>();

  return (
    <Playground setOpenApiJson={setOpenApiJson} subDoc="metadata">
      <RestApiWrapper openApiJson={openApiJson} />;
    </Playground>
  );
};

export default RestPlaygroundMetadata;
