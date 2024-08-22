import styled from '@emotion/styled';
import { JSX, ReactNode } from 'react';
import { IconComponent } from 'twenty-ui';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { PageBody } from './PageBody';
import { PageHeader } from './PageHeader';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title: string | ReactNode;
  actionButton?: ReactNode;
  Icon: IconComponent;
  className?: string;
};

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme, isMobile }) => (!isMobile ? theme.spacing(3) : 0)};
  width: 100%;
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
  actionButton,
  Icon,
  className,
}: SubMenuTopBarContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile} className={className}>
      <PageHeader
        title={title}
        Icon={Icon}
        width={OBJECT_SETTINGS_WIDTH + 4 * 8}
      >
        {actionButton}
      </PageHeader>
      <PageBody>
        <InformationBannerWrapper />
        {children}
      </PageBody>
    </StyledContainer>
  );
};
