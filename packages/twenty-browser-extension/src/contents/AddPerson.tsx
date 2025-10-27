import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from 'plasmo';
import { Button } from '~ui/components/Button';
import { withTheme } from '~utils/emotion-cache';

export const config: PlasmoCSConfig = {
  matches: ['https://www.linkedin.com/*'],
  run_at: 'document_start',
};

const styleElement = document.createElement('style');

export const getStyle: PlasmoGetStyle = () => styleElement

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const element = document.querySelector('[class$="pv-top-card-v2-ctas__custom"]') as Element;
  return { element: element, insertPosition: 'beforeend', watch: true };
};

const AddPerson = () => {
  return <Button>Add to Twenty</Button>
};

export default withTheme(AddPerson, styleElement);
