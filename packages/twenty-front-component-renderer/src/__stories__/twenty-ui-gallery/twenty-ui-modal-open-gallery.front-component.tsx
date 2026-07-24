import { defineFrontComponent } from 'twenty-sdk/define';
import { Modal } from 'twenty-ui/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

// KNOWN ISSUE: an open Modal (base-ui Dialog portal) hangs the React-runtime
// sandbox render entirely (no error, the tree never commits); it works under
// Preact. Isolated in its own fixture so the hang cannot mask the rest of the
// surfaces gallery.
const MODAL_OPEN_ENTRIES: GalleryEntry[] = [
  {
    name: 'Modal',
    node: (
      <Modal isOpen={true} ariaLabel="Open gallery modal">
        Modal body
      </Modal>
    ),
  },
];

const ModalOpenGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/surfaces Modal (open)"
      entries={MODAL_OPEN_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000111',
  name: 'twenty-ui-modal-open-gallery',
  description: 'Renders an open twenty-ui Modal in the sandbox',
  component: ModalOpenGallery,
});
