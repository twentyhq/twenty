import { sendToBackground } from '@plasmohq/messaging';
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from 'plasmo';
import { Button } from '~ui/components/button';
import { withTheme } from '~utils/emotion-cache';

export const config: PlasmoCSConfig = {
  matches: ['https://www.linkedin.com/*'],
  run_at: 'document_end',
  css: ['font.css']
};

const styleElement = document.createElement('style');

export const getStyle: PlasmoGetStyle = () => styleElement;

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const element = document.querySelector('[class$="pv-top-card-v2-ctas__custom"]') as Element;
  return { element: element, insertPosition: 'beforeend', watch: true };
};

const extractFirstAndLastName = (fullName: string) => {
  const spaceIndex = fullName.lastIndexOf(' ');
  const firstName = fullName.substring(0, spaceIndex);
  const lastName = fullName.substring(spaceIndex + 1);
  return { firstName, lastName };
};

const personNameElement = document.querySelector('h1');
const personName = personNameElement ? personNameElement.textContent : '';
const {firstName, lastName} = extractFirstAndLastName(personName);

console.log({firstName, lastName})

const AddPerson = () => {

  const handleClick = async () => {
    await sendToBackground({
      name: "open-side-panel",
    });
  };

  return <Button onClick={handleClick}>Add to Twenty</Button>
};

export default withTheme(AddPerson, styleElement);
