import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type SelectorMatchContext = {
  scopeElement: object | null;
  activeElement: object | null;
  hasSubjectElement: SelectorElementLike | null;
};
