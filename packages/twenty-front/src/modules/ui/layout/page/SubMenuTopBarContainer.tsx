import styled from '@emotion/styled';
import { JSX, ReactNode } from 'react';
import { IconComponent } from 'twenty-ui';

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import {
  Breadcrumb,
  BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { PageBody } from './PageBody';
import { PageHeader } from './PageHeader';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title?: string;
  description?: string;
  actionButton?: ReactNode;
  Icon: IconComponent;
  className?: string;
  links: BreadcrumbProps['links'];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: 1.2;
  margin: ${({ theme }) => theme.spacing(8, 8, 2)};
`;

const StyledDescription = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: ${({ theme }) => theme.spacing(4, 8, 0)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
  description,
  actionButton,
  className,
  links,
}: SubMenuTopBarContainerProps) => {
  return (
    <StyledContainer className={className}>
      <PageHeader title={<Breadcrumb links={links} />}>
        {actionButton}
      </PageHeader>
      <PageBody>
        <InformationBannerWrapper />
        {title && <StyledTitle>{title}</StyledTitle>}
        {description && <StyledDescription>{description}</StyledDescription>}
        {children}
      </PageBody>
    </StyledContainer>
  );
};
