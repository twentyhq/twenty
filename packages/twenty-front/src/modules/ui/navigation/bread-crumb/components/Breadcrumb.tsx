import { MobileBreadcrumb } from '@/ui/navigation/bread-crumb/components/MobileBreadcrumb';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { getBreadcrumbItems } from '@/ui/navigation/bread-crumb/utils/getBreadcrumbItems';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Breadcrumb as BreadcrumbPrimitive } from 'twenty-ui/primitives/navigation';
import { useIsMobile } from 'twenty-ui/utilities';

export const Breadcrumb = ({ links }: BreadcrumbProps) => {
  const isMobile = useIsMobile();

  if (isMobile && isNonEmptyArray(links)) {
    return <MobileBreadcrumb links={links} />;
  }

  return (
    <BreadcrumbPrimitive
      aria-label={t`Breadcrumb`}
      links={getBreadcrumbItems(links)}
    />
  );
};
