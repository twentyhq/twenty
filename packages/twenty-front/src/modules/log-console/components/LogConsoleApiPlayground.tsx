import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleSubPageHeader } from '@/log-console/components/LogConsoleSubPageHeader';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import { GraphQLPlayground } from '@/settings/mcp-and-apis/components/GraphQLPlayground';
import { RestPlayground } from '@/settings/mcp-and-apis/components/RestPlayground';
import { SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS } from '@/settings/mcp-and-apis/constants/SettingsPlaygroundFormSchemaSelectOptions';
import { type PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/mcp-and-apis/types/PlaygroundTypes';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledPlaygroundContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

type LogConsoleApiPlaygroundProps = {
  playgroundType: PlaygroundTypes;
  schema: PlaygroundSchemas;
};

export const LogConsoleApiPlayground = ({
  playgroundType,
  schema,
}: LogConsoleApiPlaygroundProps) => {
  const { t } = useLingui();
  const setLogConsoleApisView = useSetAtomState(logConsoleApisViewState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );

  const closePlayground = () => {
    setLogConsoleApisView({ type: 'list' });
    setIsLogConsoleFullScreen(false);
  };

  const schemaOption = SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS.find(
    (option) => option.value === schema,
  );
  const playgroundLabel =
    playgroundType === PlaygroundTypes.GRAPHQL ? t`GraphQL` : t`REST`;
  const title = schemaOption
    ? `${playgroundLabel} · ${t(schemaOption.label)}`
    : playgroundLabel;

  return (
    <>
      <LogConsoleSubPageHeader title={title} onBack={closePlayground} />
      <StyledPlaygroundContainer>
        {playgroundType === PlaygroundTypes.GRAPHQL ? (
          <GraphQLPlayground schema={schema} onError={closePlayground} />
        ) : (
          <RestPlayground schema={schema} onError={closePlayground} />
        )}
      </StyledPlaygroundContainer>
    </>
  );
};
