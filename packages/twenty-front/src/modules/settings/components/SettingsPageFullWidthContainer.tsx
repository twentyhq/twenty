import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { type ReactNode } from 'react';

type SettingsPageFullWidthContainerProps = {
  children: ReactNode;
  links: BreadcrumbProps['links'];
  actionButton?: ReactNode;
};

export const SettingsPageFullWidthContainer = ({
  children,
  links,
  actionButton,
}: SettingsPageFullWidthContainerProps) => {
  return (
    <PageContainer>
      <PageHeader title={<Breadcrumb links={links} />}>
        {actionButton}
      </PageHeader>
      <PageBody>{children}</PageBody>
    </PageContainer>
  );
};
