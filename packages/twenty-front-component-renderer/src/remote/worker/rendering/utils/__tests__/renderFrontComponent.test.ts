import { type RemoteConnection } from '@remote-dom/core/elements';
import { renderFrontComponent } from '../renderFrontComponent';

describe('renderFrontComponent', () => {
  it('should fail closed when the host fetch bridge is unavailable', async () => {
    await expect(
      renderFrontComponent({
        connection: {} as RemoteConnection,
        renderContext: {
          componentUrl: 'https://api.twenty.test/rest/front-components/id',
          componentSource: 'export default () => {};',
        },
        hostFetch: null,
      }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_HOST_FETCH_UNAVAILABLE',
    });
  });
});
