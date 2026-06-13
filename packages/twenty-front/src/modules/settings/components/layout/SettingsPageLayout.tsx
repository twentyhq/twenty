import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { type JSX, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  actionButton?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
  tag?: JSX.Element;
  titleColor?: string;
};

export const SettingsPageLayout = ({
  links,
  title,
  actionButton,
  secondaryBar,
  children,
  tag,
  titleColor,
}: SettingsPageLayoutProps) => (
  <PageCardLayout
    header={
      <PageCardHeader
        links={links}
        title={title}
        tag={tag}
        actionButton={actionButton}
        centerTitle
        titleColor={titleColor}
      />
    }
    secondaryBar={
      isDefined(secondaryBar) ? (
        <SettingsSecondaryBar>{secondaryBar}</SettingsSecondaryBar>
      ) : undefined
    }
  >
    {children}
  </PageCardLayout>
);
