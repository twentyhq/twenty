import { MobileBreadcrumb } from '@/ui/navigation/bread-crumb/components/MobileBreadcrumb';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { getBreadcrumbItems } from '@/ui/navigation/bread-crumb/utils/getBreadcrumbItems';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Breadcrumb as BreadcrumbPrimitive } from 'twenty-ui/primitives/navigation';
import { useIsMobile } from 'twenty-ui/utilities';

export const Breadcrumb = ({ className, links }: BreadcrumbProps) => {
  const isMobile = useIsMobile();

  if (isMobile && isNonEmptyArray(links)) {
    return <MobileBreadcrumb className={className} links={links} />;
  }

  return (
    <BreadcrumbPrimitive
      aria-label={t`Breadcrumb`}
      className={className}
      links={getBreadcrumbItems(links)}
    />
  );
};
