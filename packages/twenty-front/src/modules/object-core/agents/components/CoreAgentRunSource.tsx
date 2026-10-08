import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconApi,
  IconApps,
  IconBolt,
  IconSettingsAutomation,
  IconUsers,
} from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const SOURCE_ICONS: Partial<Record<string, typeof IconApps>> = {
  [FieldActorSource.WORKFLOW]: IconSettingsAutomation,
  [FieldActorSource.APPLICATION]: IconApps,
  [FieldActorSource.API]: IconApi,
  [FieldActorSource.MANUAL]: IconUsers,
  [FieldActorSource.AGENT]: IconBolt,
};

type CoreAgentRunSourceProps = {
  creatorSource: string;
  creatorName: string;
};

export const CoreAgentRunSource = ({
  creatorSource,
  creatorName,
}: CoreAgentRunSourceProps) => {
  const theme = useTheme();
  const SourceIcon = SOURCE_ICONS[creatorSource];

  return (
    <StyledContainer>
      {isDefined(SourceIcon) ? (
        <SourceIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      ) : null}
      <OverflowingTextWithTooltip
        text={
          // trigger runs are recorded as the agent itself, which this page already names
          creatorSource === FieldActorSource.AGENT ? t`Trigger` : creatorName
        }
      />
    </StyledContainer>
  );
};
