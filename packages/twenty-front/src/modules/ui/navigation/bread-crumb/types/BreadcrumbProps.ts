import { type BreadcrumbItem } from 'twenty-ui/primitives/navigation';

export type BreadcrumbProps = {
  className?: string;
  links: Pick<BreadcrumbItem, 'children' | 'href'>[];
};
