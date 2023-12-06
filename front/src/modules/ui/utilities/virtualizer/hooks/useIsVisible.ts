import { useInView } from 'react-intersection-observer';

export const useIsVisible = ({ rootElement }: { rootElement: Element }) => {
  const { ref: elementRef, inView } = useInView({
    root: rootElement,
    rootMargin: '200px',
  });

  return { elementRef, inView };
};
