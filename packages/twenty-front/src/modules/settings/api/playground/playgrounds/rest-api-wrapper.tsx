import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export const RestApiWrapper = ({ openApiJson }: { openApiJson: any }) => {

  return (
    <div
      style={{
        height: 'calc(100vh - var(--ifm-navbar-height) - 45px)',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <ApiReferenceReact
        configuration={{
          spec: {
            content: openApiJson
          },
        }}
      />
    </div>
  );
};
