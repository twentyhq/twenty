import { TaskItem } from '@tiptap/extension-list';
import { isDefined } from 'twenty-shared/utils';

export const ReadOnlyAwareTaskItem = TaskItem.extend({
  addNodeView() {
    const createNodeView = this.parent?.();

    if (!isDefined(createNodeView)) {
      return null;
    }

    return (props) => {
      const nodeView = createNodeView(props);
      const checkbox =
        nodeView.dom instanceof HTMLElement
          ? nodeView.dom.querySelector('input[type="checkbox"]')
          : null;

      if (checkbox instanceof HTMLInputElement) {
        checkbox.disabled = !props.editor.isEditable;
      }

      return nodeView;
    };
  },
});
