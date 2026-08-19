import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoreObjectPageHeader } from '@/object-core/components/CoreObjectPageHeader';

const StyledPage = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  width: 100%;
`;

type CoreObjectIndexPageLayoutProps = {
  Icon: IconComponent;
  title: string;
  children: ReactNode;
};

export const CoreObjectIndexPageLayout = ({
  Icon,
  title,
  children,
}: CoreObjectIndexPageLayoutProps) => (
  <StyledPage>
    <CoreObjectPageHeader Icon={Icon} title={title} />
    {children}
  </StyledPage>
);
