import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';
import { LOG_CONSOLE_API_DOCUMENTATION_SCHEMAS } from '@/log-console/constants/LogConsoleApiDocumentationSchemas';
import { LOG_CONSOLE_API_DOCUMENTATION_TYPES } from '@/log-console/constants/LogConsoleApiDocumentationTypes';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import { GraphQLPlayground } from '@/settings/mcp-and-apis/components/GraphQLPlayground';
import { RestPlayground } from '@/settings/mcp-and-apis/components/RestPlayground';
import { type PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/mcp-and-apis/types/PlaygroundTypes';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
`;

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

  const title = [
    LOG_CONSOLE_API_DOCUMENTATION_TYPES.find(
      (documentationType) => documentationType.value === playgroundType,
    ),
    LOG_CONSOLE_API_DOCUMENTATION_SCHEMAS.find(
      (documentationSchema) => documentationSchema.value === schema,
    ),
  ]
    .filter(isDefined)
    .map((option) => t(option.label))
    .join(' · ');

  return (
    <>
      <LogConsoleToolbarLayout>
        <LightIconButton
          tooltip={t`Back`}
          aria-label={t`Back`}
          onClick={closePlayground}
        >
          <IconChevronLeft />
        </LightIconButton>
        <StyledTitle>
          <OverflowingTextWithTooltip text={title} />
        </StyledTitle>
      </LogConsoleToolbarLayout>
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
