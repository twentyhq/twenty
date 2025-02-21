import Playground from '@/settings/api/playground/components/Playground';
import { PlaygroundSchemas } from '@/settings/api/playground/form/components/ApiPlaygroundSetupForm';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useState } from 'react';

export const RestApiWrapper = ({
  subDoc
} : {
  subDoc: PlaygroundSchemas
}) => {
  const [openApiJson, setOpenApiJson] = useState<object>();

  return (
    <Playground setOpenApiJson={setOpenApiJson} subDoc={subDoc}>
      <ApiReferenceReact
        configuration={{
          spec: {
            content: openApiJson,
          },
        }}
      />
    </Playground>
  );
};
