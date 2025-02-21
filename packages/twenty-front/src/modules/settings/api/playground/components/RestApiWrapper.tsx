import { openAPIReference } from '@/settings/api/playground/state/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useRecoilState } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  height: 100vh;
  position: relative;
  width: 100vw;
`;

export const RestApiWrapper = () => {
  const [ openApiJson ] = useRecoilState(openAPIReference)

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: <Trans>Rest API Playground</Trans> },
      ]}
    >
      <StyledContainer>
        <ApiReferenceReact
          configuration={{
            spec: {
              content: openApiJson,
            },
          }}
        />
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
