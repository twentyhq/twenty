import { defineFrontComponent } from 'twenty-sdk/define';
import { useState } from 'react';
import { CodeEditor } from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

// KNOWN ISSUE: CodeEditor wraps @monaco-editor/react, which lazy-loads the
// monaco runtime through script injection at mount. The sandbox worker has no
// script loading (polyfilled DOM, opaque-origin CSP), so monaco can never
// become interactive. This fixture documents that empirically: the dedicated
// story fails until front components get a supported code editor path.
const CodeEditorComponent = () => {
  const [mountState, setMountState] = useState<'pending' | 'mounted'>(
    'pending',
  );

  return (
    <ThemeProvider colorScheme="light">
      <div
        data-testid="code-editor-component"
        data-monaco-mount-state={mountState}
        style={{ fontFamily: 'system-ui, sans-serif', width: 480 }}
      >
        <CodeEditor
          value={'const greeting = "hello";'}
          language="typescript"
          height={200}
          onMount={() => setMountState('mounted')}
        />
      </div>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000112',
  name: 'twenty-ui-code-editor-gallery',
  description: 'Renders the monaco-based twenty-ui CodeEditor in the sandbox',
  component: CodeEditorComponent,
});
