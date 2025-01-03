import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { isDefined } from '~/utils/isDefined';

const StyledSettingsPageContainer = styled.div<{
  width?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(6, 8, 8)};
  width: ${({ width }) => {
    if (isDefined(width)) {
      return width + 'px';
    }
    if (useIsMobile()) {
      return 'unset';
    }
    return OBJECT_SETTINGS_WIDTH + 'px';
  }};
  padding-bottom: ${({ theme }) => theme.spacing(20)};
`;

export const SettingsPageContainer = ({
  children,
}: {
  children: ReactNode;
}) => (
  <ScrollWrapper
    contextProviderName="settingsPageContainer"
    componentInstanceId={'scroll-wrapper-settings-page-container'}
  >
    <StyledSettingsPageContainer>{children}</StyledSettingsPageContainer>
  </ScrollWrapper>
);
