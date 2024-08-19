import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from '~/utils/isDefined';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledSettingsPageContainer = styled.div<{ width?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${({ width }) => {
    if (isDefined(width)) {
      return width + 'px';
    }
    if (useIsMobile()) {
      return 'unset';
    }
    return OBJECT_SETTINGS_WIDTH + 'px';
  }};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export const SettingsPageContainer = ({
  children,
}: {
  children: ReactNode;
}) => (
  <StyledScrollWrapper>
    <StyledSettingsPageContainer>{children}</StyledSettingsPageContainer>
  </StyledScrollWrapper>
);
