declare module '*.svg?react' {
  import { type FunctionComponent, type SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}
