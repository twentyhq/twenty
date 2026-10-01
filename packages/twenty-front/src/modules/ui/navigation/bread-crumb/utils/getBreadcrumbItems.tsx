import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { type BreadcrumbItem } from 'twenty-ui/primitives/navigation';

export const getBreadcrumbItems = (
  links: BreadcrumbProps['links'],
): BreadcrumbItem[] => {
  return links.map(({ children, href }) => ({
    children,
    href: isNonEmptyString(href) ? href : undefined,
    render: isNonEmptyString(href) ? <Link to={href} /> : undefined,
  }));
};
