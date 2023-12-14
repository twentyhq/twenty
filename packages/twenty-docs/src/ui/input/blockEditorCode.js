import { useBlockNote } from "@blocknote/react";
import { BlockEditor } from "@/ui/input/editor/components/BlockEditor";

export const MyComponent = () => {
  const BlockNoteEditor = useBlockNote();

  return <BlockEditor editor={BlockNoteEditor} />;
};
