import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import {
  IconMap,
  IconPhotoUp,
  IconPhone,
  IconRefresh,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledStatusGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const StyledStatusPanel = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 132px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPanelHeader = styled.div`
  align-items: center;
  color: ${SHAHRYAR_COLORS.navy};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPanelValue = styled.strong`
  color: ${SHAHRYAR_COLORS.blue};
  font-size: 24px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledPanelMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

export const ShahryarMobileAppPage = () => (
  <PageContainer dir="rtl">
    <PageHeader title="مۆبایل ئەپ" Icon={IconPhone} />
    <PageBody>
      <StyledContent>
        <StyledStatusGrid>
          <StyledStatusPanel>
            <StyledPanelHeader>
              <IconPhone size={18} />
              <span>موشریفە چالاکەکان</span>
            </StyledPanelHeader>
            <StyledPanelValue>18</StyledPanelValue>
            <StyledPanelMeta>Android + iPhone</StyledPanelMeta>
          </StyledStatusPanel>
          <StyledStatusPanel>
            <StyledPanelHeader>
              <IconMap size={18} />
              <span>GPS Tracking</span>
            </StyledPanelHeader>
            <StyledPanelValue>96%</StyledPanelValue>
            <StyledPanelMeta>چێک-ئینەکانی ئەمڕۆ</StyledPanelMeta>
          </StyledStatusPanel>
          <StyledStatusPanel>
            <StyledPanelHeader>
              <IconPhotoUp size={18} />
              <span>وێنەکان</span>
            </StyledPanelHeader>
            <StyledPanelValue>74</StyledPanelValue>
            <StyledPanelMeta>وێنەی دوکان و سەردان</StyledPanelMeta>
          </StyledStatusPanel>
          <StyledStatusPanel>
            <StyledPanelHeader>
              <IconRefresh size={18} />
              <span>Sync</span>
            </StyledPanelHeader>
            <StyledPanelValue>11</StyledPanelValue>
            <StyledPanelMeta>ڕیزی ئۆفلاین</StyledPanelMeta>
          </StyledStatusPanel>
        </StyledStatusGrid>
      </StyledContent>
    </PageBody>
  </PageContainer>
);
