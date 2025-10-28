import styled from '@emotion/styled';
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle,
  PlasmoMountShadowHost
} from 'plasmo';
import { Button } from '~ui/components/Button';
import { withTheme } from '~utils/emotion-cache';

export const config: PlasmoCSConfig = {
  matches: ['https://www.linkedin.com/*'],
  run_at: 'document_end',
  css: ['font.css']
};

const styleElement = document.createElement('style');

export const getStyle: PlasmoGetStyle = () => styleElement

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const element = document.querySelector('[class="org-top-card-primary-actions__inner') as Element;
  return { element, watch: true };
};

export const mountShadowHost: PlasmoMountShadowHost = ({
  shadowHost,
  anchor,
  mountState
}) => {
  anchor?.element.appendChild(shadowHost);
  mountState?.observer?.disconnect();
}

const StyledContainer = styled.div`
  margin: ${({theme}) => `${theme.spacing(1)} ${0} ${0} ${theme.spacing(2)}`};
`;

const AddCompany = () => {
  return <StyledContainer><Button>Add to Twenty</Button></StyledContainer>
};

export default withTheme(AddCompany, styleElement);
