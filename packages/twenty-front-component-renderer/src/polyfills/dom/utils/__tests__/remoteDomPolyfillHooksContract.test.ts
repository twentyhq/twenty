import { HOOKS, type Hooks, Window } from '@remote-dom/polyfill';

// The worker MutationObserver is built by wrapping the hooks @remote-dom/polyfill
// already calls on every DOM operation. A remote-dom upgrade that renames or
// stops calling one of them must fail here instead of silently going quiet.
const createHookRecorder = () => {
  const polyfillWindow = new Window();
  const calls: { name: keyof Hooks; args: unknown[] }[] = [];
  const hooks = (polyfillWindow as unknown as Record<symbol, Partial<Hooks>>)[
    HOOKS
  ];

  const recordedHookNames: (keyof Hooks)[] = [
    'createElement',
    'createText',
    'setText',
    'setAttribute',
    'removeAttribute',
    'insertChild',
    'removeChild',
  ];

  for (const hookName of recordedHookNames) {
    hooks[hookName] = (...args: unknown[]) => {
      calls.push({ name: hookName, args });
    };
  }

  return {
    calls,
    document: polyfillWindow.document as unknown as Document,
    callsNamed: (hookName: keyof Hooks) =>
      calls.filter((call) => call.name === hookName),
  };
};

describe('@remote-dom/polyfill mutation hooks contract', () => {
  it('exports HOOKS as a symbol keying a mutable hooks object', () => {
    const polyfillWindow = new Window();

    expect(typeof HOOKS).toBe('symbol');
    expect(
      typeof (polyfillWindow as unknown as Record<symbol, unknown>)[HOOKS],
    ).toBe('object');
  });

  it('still ships MutationObserver without an observe method', () => {
    const polyfillWindow = new Window();

    expect(
      polyfillWindow.MutationObserver.prototype as unknown as Record<
        string,
        unknown
      >,
    ).not.toHaveProperty('observe');
  });

  it('calls createElement when an element is created', () => {
    const { document, callsNamed } = createHookRecorder();

    const element = document.createElement('div');

    expect(callsNamed('createElement')).toHaveLength(1);
    expect(callsNamed('createElement')[0].args[0]).toBe(element);
  });

  it('calls createText and setText with the text node and its data', () => {
    const { document, callsNamed } = createHookRecorder();

    const text = document.createTextNode('first');
    text.data = 'second';

    expect(callsNamed('createText')[0].args[0]).toBe(text);
    expect(callsNamed('createText')[0].args[1]).toBe('first');
    expect(callsNamed('setText')[0].args[0]).toBe(text);
    expect(callsNamed('setText')[0].args[1]).toBe('second');
  });

  it('calls setAttribute and removeAttribute with the element and attribute name', () => {
    const { document, callsNamed } = createHookRecorder();

    const element = document.createElement('div');
    element.setAttribute('title', 'hello');
    element.removeAttribute('title');

    expect(callsNamed('setAttribute')[0].args[0]).toBe(element);
    expect(callsNamed('setAttribute')[0].args[1]).toBe('title');
    expect(callsNamed('setAttribute')[0].args[2]).toBe('hello');
    expect(callsNamed('removeAttribute')[0].args[0]).toBe(element);
    expect(callsNamed('removeAttribute')[0].args[1]).toBe('title');
  });

  it('calls insertChild and removeChild with the parent, the node and its index', () => {
    const { document, callsNamed } = createHookRecorder();

    const parent = document.createElement('div');
    const firstChild = document.createElement('span');
    const secondChild = document.createElement('span');

    parent.appendChild(firstChild);
    parent.appendChild(secondChild);
    parent.removeChild(secondChild);

    expect(callsNamed('insertChild')[1].args[0]).toBe(parent);
    expect(callsNamed('insertChild')[1].args[1]).toBe(secondChild);
    expect(callsNamed('insertChild')[1].args[2]).toBe(1);
    expect(callsNamed('removeChild')[0].args[0]).toBe(parent);
    expect(callsNamed('removeChild')[0].args[1]).toBe(secondChild);
    expect(callsNamed('removeChild')[0].args[2]).toBe(1);
  });
});
