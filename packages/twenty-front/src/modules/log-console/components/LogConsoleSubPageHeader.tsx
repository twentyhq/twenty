import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
`;

type LogConsoleSubPageHeaderProps = {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
};

export const LogConsoleSubPageHeader = ({
  title,
  onBack,
  actions,
}: LogConsoleSubPageHeaderProps) => {
  const { t } = useLingui();

  return (
    <LogConsoleToolbarLayout actions={actions}>
      <LightIconButton tooltip={t`Back`} aria-label={t`Back`} onClick={onBack}>
        <IconChevronLeft />
      </LightIconButton>
      <StyledTitle>
        <OverflowingTextWithTooltip text={title} />
      </StyledTitle>
    </LogConsoleToolbarLayout>
  );
};
