import { defineFrontComponent } from 'twenty-sdk/define';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const IframeSandboxDangerousFrontComponent = () => (
  <FrontComponentCard title="iframe:sandbox-dangerous">
    <iframe
      data-testid="subject"
      title="probe"
      sandbox="allow-scripts allow-same-origin allow-top-navigation allow-popups-to-escape-sandbox"
      style={{ ...FILL_RECT_STYLE, height: 80 }}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-iframe-sb-dgr-00000000-0000-0000-0000-000000000020',
  name: 'iframe-sandbox-dangerous-front-component',
  description: 'Front component declaring an <iframe> with a dangerous sandbox',
  component: IframeSandboxDangerousFrontComponent,
});
