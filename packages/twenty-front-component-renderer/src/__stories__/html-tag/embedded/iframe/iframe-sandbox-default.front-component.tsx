import { defineFrontComponent } from 'twenty-sdk/define';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const IframeSandboxDefaultFrontComponent = () => (
  <FrontComponentCard title="iframe:sandbox-default">
    <iframe
      data-testid="subject"
      title="probe"
      style={{ ...FILL_RECT_STYLE, height: 80 }}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-iframe-sb-def-00000000-0000-0000-0000-000000000020',
  name: 'iframe-sandbox-default-front-component',
  description: 'Front component declaring an <iframe> without a sandbox value',
  component: IframeSandboxDefaultFrontComponent,
});
