import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

export const StyledAnimatedScrollBarContainer = styled.div`
  overflow: auto;

  ::-webkit-scrollbar {
    width: 0px;
  }

  &.scrolling::-webkit-scrollbar {
    width: 4px;
  }
`;

export function useListenToScroll<T extends Element>({
  ref,
  wait = 2000,
}: {
  ref: React.RefObject<T>;
  wait?: number;
}) {
  return function handleScrolling() {
    ref.current?.classList.add('scrolling');
    debounce(() => {
      ref.current?.classList.remove('scrolling');
    }, wait)();
  };
}
