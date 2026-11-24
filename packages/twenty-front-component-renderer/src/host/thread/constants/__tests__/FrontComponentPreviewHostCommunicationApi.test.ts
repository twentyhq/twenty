import { AppPath } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API } from '@/host/thread/constants/FrontComponentPreviewHostCommunicationApi';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '@/remote/worker/thread/utils/buildFrontComponentHostCommunicationApiFromThreadImports';
import { pendingCommandConfirmationModalPromiseCallbacks } from '@/remote/worker/thread/states/pendingCommandConfirmationModalPromiseCallbacks';

it('rejects preview navigation, clipboard, uploads and storage instead of reporting success', async () => {
  const preview = FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API;
  const expected = { code: 'FRONT_COMPONENT_PREVIEW_HOST_ACTION_UNAVAILABLE' };
  await expect(preview.navigate(AppPath.Settings)).rejects.toMatchObject(
    expected,
  );
  await expect(preview.copyToClipboard('sample')).rejects.toMatchObject(
    expected,
  );
  await expect(preview.closeSidePanel()).rejects.toMatchObject(expected);
  await expect(
    preview.uploadFile(new Blob(['sample']), { fieldMetadataId: 'field' }),
  ).rejects.toMatchObject(expected);
  await expect(
    preview.storageSet({
      storageType: 'localStorage',
      key: 'key',
      serializedValue: 'sample',
    }),
  ).rejects.toMatchObject(expected);
});

it('settles preview confirmations and clears pending state so they can be retried', async () => {
  const preview = buildFrontComponentHostCommunicationApiFromThreadImports(
    FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API,
  );
  const params = { title: 'Confirm', subtitle: 'Preview only' };
  await expect(preview.openCommandConfirmationModal(params)).rejects.toThrow(
    'Host actions are unavailable',
  );
  expect(pendingCommandConfirmationModalPromiseCallbacks.current).toBeNull();
  await expect(preview.openCommandConfirmationModal(params)).rejects.toThrow(
    'Host actions are unavailable',
  );
  expect(pendingCommandConfirmationModalPromiseCallbacks.current).toBeNull();
});
