import { createState } from 'twenty-ui/utilities';

export const animateModalURLState = createState<boolean>({
  key: 'animateModalURLState',
  defaultValue: true,
  effects: [
    ({ setSelf, onSet }) => {
      const searchParams = new URLSearchParams(window.location.search);
      const value = searchParams.get('animateModal');

      if (value !== null) {
        if (value === 'true') {
          setSelf(true);
        } else if (value === 'false') {
          setSelf(false);
        }
      }

      onSet((newValue) => {
        const searchParams = new URLSearchParams(window.location.search);

        if (newValue === true) {
          searchParams.set('animateModal', 'true');
        } else if (newValue === false) {
          searchParams.set('animateModal', 'false');
        } else {
          searchParams.delete('animateModal');
        }

        const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      });
    },
  ],
});
