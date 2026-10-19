import { type BreadcrumbItem } from 'twenty-ui/primitives/navigation';

export type BreadcrumbProps = {
  links: Pick<BreadcrumbItem, 'children' | 'href'>[];
};
