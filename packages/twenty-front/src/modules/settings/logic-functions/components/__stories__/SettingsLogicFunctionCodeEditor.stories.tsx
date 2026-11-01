import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { type CodeEditorProps } from 'twenty-ui/components/code-editor';
import { ComponentDecorator } from 'twenty-ui/testing';

import { getSettingsLogicFunctionCodeEditorModelPath } from '@/settings/logic-functions/utils/getSettingsLogicFunctionCodeEditorModelPath';
import { ReopeningSettingsLogicFunctionCodeEditor } from '@/settings/logic-functions/components/__stories__/ReopeningSettingsLogicFunctionCodeEditor';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const handleMount = fn<NonNullable<CodeEditorProps['onMount']>>();
const handleChange = fn<NonNullable<CodeEditorProps['onChange']>>();
const EDITOR_LOAD_TIMEOUT_IN_MS = 20_000;
const BORROWED_FILE_PATH_PREFIX = '/logic-function-borrowed-model-story';

const getMountedEditor = () => {
  const mountedEditor = handleMount.mock.calls.at(-1);

  if (!isDefined(mountedEditor)) {
    throw new Error('The logic function editor has not mounted');
  }

  const [editor, monaco] = mountedEditor;

  return { editor, monaco };
};

const waitForRenderedSource = async ({
  canvasElement,
  expectedSource,
}: {
  canvasElement: HTMLElement;
  expectedSource: string;
}) => {
  await waitFor(
    () => {
      expect(handleMount).toHaveBeenCalled();
      expect(canvasElement.querySelector('.view-lines')).toHaveTextContent(
        expectedSource,
        { normalizeWhitespace: false },
      );
    },
    { timeout: EDITOR_LOAD_TIMEOUT_IN_MS },
  );
};

const meta: Meta<typeof ReopeningSettingsLogicFunctionCodeEditor> = {
  title: 'Modules/Settings/LogicFunctions/SettingsLogicFunctionCodeEditor',
  component: ReopeningSettingsLogicFunctionCodeEditor,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
  args: {
    filePathPrefix: '/logic-function-reopen-story',
    onMount: handleMount,
    onChange: handleChange,
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyAvailablePackages', () =>
          HttpResponse.json({ data: { getAvailablePackages: {} } }),
        ),
      ],
    },
  },
  beforeEach: () => {
    handleMount.mockClear();
    handleChange.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof ReopeningSettingsLogicFunctionCodeEditor>;

export const ReopenAfterFileSwitch: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await waitForRenderedSource({
      canvasElement,
      expectedSource: "export const source = 'initial';",
    });

    const { monaco } = getMountedEditor();
    const indexModelUri = monaco.Uri.parse(
      getSettingsLogicFunctionCodeEditorModelPath(
        `${args.filePathPrefix}/index.ts`,
      ),
    );
    const helperModelUri = monaco.Uri.parse(
      getSettingsLogicFunctionCodeEditorModelPath(
        `${args.filePathPrefix}/helper.ts`,
      ),
    );
    const indexModel = monaco.editor.getModel(indexModelUri);
    const helperModel = monaco.editor.getModel(helperModelUri);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Select helper file' }),
    );
    await waitForRenderedSource({
      canvasElement,
      expectedSource: "export const helper = 'secondary';",
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Close editor' }));
    await waitFor(() => {
      expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
      expect(indexModel?.isDisposed()).toBe(true);
      expect(helperModel?.isDisposed()).toBe(true);
      expect(monaco.editor.getModel(indexModelUri)).toBeNull();
      expect(monaco.editor.getModel(helperModelUri)).toBeNull();
    });

    handleMount.mockClear();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reopen with updated source' }),
    );
    await waitForRenderedSource({
      canvasElement,
      expectedSource: "export const source = 'updated';",
    });
    const { editor } = getMountedEditor();
    expect(editor.getValue()).toBe("export const source = 'updated';");
    expect(editor.getModel()).not.toBe(indexModel);
    editor.setPosition({ lineNumber: 1, column: 1 });
    canvas.getByRole('textbox').focus();
    handleChange.mockClear();
    await userEvent.keyboard('x');
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        "xexport const source = 'updated';",
        expect.any(Object),
      );
      expect(editor.getValue()).toBe("xexport const source = 'updated';");
    });
    await waitForRenderedSource({
      canvasElement,
      expectedSource: "xexport const source = 'updated';",
    });
  },
};

export const KeepCurrentModel: Story = {
  args: {
    filePathPrefix: '/logic-function-retained-model-story',
    keepCurrentModel: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await waitForRenderedSource({
      canvasElement,
      expectedSource: "export const source = 'initial';",
    });
    const { monaco } = getMountedEditor();
    const modelUris = ['index.ts', 'helper.ts'].map((filename) =>
      monaco.Uri.parse(
        getSettingsLogicFunctionCodeEditorModelPath(
          `${args.filePathPrefix}/${filename}`,
        ),
      ),
    );
    const models = modelUris.map((modelUri) =>
      monaco.editor.getModel(modelUri),
    );

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Select helper file' }),
      );
      await waitForRenderedSource({
        canvasElement,
        expectedSource: "export const helper = 'secondary';",
      });
      await userEvent.click(
        canvas.getByRole('button', { name: 'Close editor' }),
      );
      await waitFor(() => {
        expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();

        for (const [index, modelUri] of modelUris.entries()) {
          expect(models[index]?.isDisposed()).toBe(false);
          expect(monaco.editor.getModel(modelUri)).toBe(models[index]);
        }
      });
      handleChange.mockClear();

      for (const model of models) {
        model?.setValue('Updated after closing');
      }

      expect(handleChange).not.toHaveBeenCalled();
    } finally {
      for (const model of models) {
        model?.dispose();
      }
    }
  },
};

export const BorrowedModel: Story = {
  args: {
    filePathPrefix: BORROWED_FILE_PATH_PREFIX,
    beforeMount: (monaco) => {
      monaco.editor.createModel(
        "export const helper = 'secondary';",
        'typescript',
        monaco.Uri.parse(
          getSettingsLogicFunctionCodeEditorModelPath(
            `${BORROWED_FILE_PATH_PREFIX}/helper.ts`,
          ),
        ),
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await waitForRenderedSource({
      canvasElement,
      expectedSource: "export const source = 'initial';",
    });
    const { editor, monaco } = getMountedEditor();
    const indexModel = editor.getModel();
    const helperModelUri = monaco.Uri.parse(
      getSettingsLogicFunctionCodeEditorModelPath(
        `${args.filePathPrefix}/helper.ts`,
      ),
    );
    const helperModel = monaco.editor.getModel(helperModelUri);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Close editor' }),
      );
      await waitFor(() => {
        expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
        expect(indexModel?.isDisposed()).toBe(true);
        expect(helperModel?.isDisposed()).toBe(false);
        expect(monaco.editor.getModel(helperModelUri)).toBe(helperModel);
      });
    } finally {
      helperModel?.dispose();
    }
  },
};
