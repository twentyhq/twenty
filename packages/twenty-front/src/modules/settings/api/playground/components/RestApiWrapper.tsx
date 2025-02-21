import Playground from '@/settings/api/playground/components/Playground';
import { SubDoc } from '@/settings/api/playground/components/TokenForm';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useState } from 'react';

export const RestApiWrapper = ({
  subDoc
} : {
  subDoc: SubDoc
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
