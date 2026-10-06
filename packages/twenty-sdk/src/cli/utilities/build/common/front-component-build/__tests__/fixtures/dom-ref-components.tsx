import { useRender } from '@base-ui/react/use-render';
import {
  Component,
  cloneElement,
  createElement,
  forwardRef,
  memo,
  type ReactElement,
  type ReactNode,
  type Ref,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

type RefButtonProps = {
  ref?: Ref<HTMLButtonElement>;
  renderRef?: Ref<HTMLButtonElement>;
  label: string;
  onClick?: () => void;
};

const RefButton = ({ ref, label, onClick }: RefButtonProps) => (
  <button ref={ref} onClick={onClick}>
    {label}
  </button>
);

const ForwardRefButton = forwardRef<
  HTMLButtonElement,
  Omit<RefButtonProps, 'ref'>
>((props, ref) => (
  <RefButton label={props.label} onClick={props.onClick} ref={ref} />
));

const MemoRefButton = memo(RefButton);

type InstanceButtonProps = {
  label: string;
  onClick?: () => void;
};

class InstanceButton extends Component<InstanceButtonProps> {
  getLabel() {
    return this.props.label;
  }

  render() {
    return <button onClick={this.props.onClick}>{this.props.label}</button>;
  }
}

const ForwardRefInstanceButton = forwardRef<
  InstanceButton,
  InstanceButtonProps
>((props, ref) => (
  <InstanceButton ref={ref} label={props.label} onClick={props.onClick} />
));

const RenderButton = ({ ref, renderRef, ...props }: RefButtonProps) =>
  useRender({
    render: <RefButton label={props.label} ref={renderRef} />,
    ref,
    props,
  });

const RenderPropSlot = ({ element }: { element: ReactElement }) =>
  useRender({ render: element });

type ElementRefReaderProps = {
  element: ReactElement<{ ref?: unknown }>;
  onRead: (elementRef: unknown) => void;
};

const ElementRefReader = ({ element, onRead }: ElementRefReaderProps) => {
  onRead(element.props.ref);

  return null;
};

type CloneRefSlotProps = {
  children: ReactElement<{ ref?: Ref<HTMLButtonElement> }>;
  cloneRef: Ref<HTMLButtonElement>;
};

const CloneRefSlot = ({ children, cloneRef }: CloneRefSlotProps) => {
  const [renderCount, setRenderCount] = useState(0);

  return (
    <div>
      <button onClick={() => setRenderCount(renderCount + 1)}>
        {`Re-render ${renderCount}`}
      </button>
      {cloneElement(children, { ref: cloneRef })}
    </div>
  );
};

type RenderPropSwitchProps = {
  element: ReactElement;
  switchLabel: string;
};

const RenderPropSwitch = ({ element, switchLabel }: RenderPropSwitchProps) => {
  const [rendersThroughRenderProp, setRendersThroughRenderProp] =
    useState(false);

  return (
    <div>
      <button onClick={() => setRendersThroughRenderProp(true)}>
        {switchLabel}
      </button>
      {rendersThroughRenderProp ? (
        <RenderPropSlot element={element} />
      ) : (
        element
      )}
    </div>
  );
};

type Composition =
  | 'native'
  | 'plain-function'
  | 'forward-ref'
  | 'memo'
  | 'create-element'
  | 'clone-element'
  | 'base-ui-render';

type ReusableElementProps =
  | {
      kind: 'host' | 'function' | 'forward-ref' | 'memo';
      label: string;
      ref?: Ref<HTMLButtonElement>;
      onClick?: () => void;
    }
  | {
      kind: 'class';
      label: string;
      ref?: Ref<InstanceButton>;
      onClick?: () => void;
    };

const createReusableElementOfKind = (props: ReusableElementProps) => {
  switch (props.kind) {
    case 'host':
      return (
        <button ref={props.ref} onClick={props.onClick}>
          {props.label}
        </button>
      );
    case 'function':
      return (
        <RefButton
          ref={props.ref}
          label={props.label}
          onClick={props.onClick}
        />
      );
    case 'forward-ref':
      return (
        <ForwardRefButton
          ref={props.ref}
          label={props.label}
          onClick={props.onClick}
        />
      );
    case 'memo':
      return (
        <MemoRefButton
          ref={props.ref}
          label={props.label}
          onClick={props.onClick}
        />
      );
    case 'class':
      return (
        <InstanceButton
          ref={props.ref}
          label={props.label}
          onClick={props.onClick}
        />
      );
  }
};

export const createDomRefFixture = (container: Element) => {
  const root = createRoot(container);
  const renderSynchronously = (children: ReactNode) =>
    flushSync(() => root.render(children));
  const runUpdate = async (update: () => void) => {
    flushSync(update);
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  return {
    render: ({
      composition,
      ...props
    }: RefButtonProps & { composition: Composition }) => {
      const components = {
        native: (
          <button ref={props.ref} onClick={props.onClick}>
            {props.label}
          </button>
        ),
        'plain-function': (
          <RefButton
            ref={props.ref}
            label={props.label}
            onClick={props.onClick}
          />
        ),
        'forward-ref': (
          <ForwardRefButton
            ref={props.ref}
            label={props.label}
            onClick={props.onClick}
          />
        ),
        memo: (
          <MemoRefButton
            ref={props.ref}
            label={props.label}
            onClick={props.onClick}
          />
        ),
        'create-element': createElement(RefButton, props),
        'clone-element': cloneElement(<RefButton label={props.label} />, props),
        'base-ui-render': (
          <RenderButton
            ref={props.ref}
            label={props.label}
            onClick={props.onClick}
          />
        ),
      };

      renderSynchronously(components[composition]);
    },
    renderComposedRefs: (props: RefButtonProps) =>
      renderSynchronously(
        <RenderButton
          ref={props.ref}
          renderRef={props.renderRef}
          label={props.label}
        />,
      ),
    renderCloneRefSlot: ({
      label,
      cloneRef,
      onClick,
    }: {
      label: string;
      cloneRef: Ref<HTMLButtonElement>;
      onClick: () => void;
    }) =>
      renderSynchronously(
        <CloneRefSlot cloneRef={cloneRef}>
          <button onClick={onClick}>{label}</button>
        </CloneRefSlot>,
      ),
    renderKeyedList: (
      items: { label: string; ref: Ref<HTMLButtonElement> }[],
    ) =>
      renderSynchronously(
        <>
          {items.map((item) => (
            <RefButton key={item.label} ref={item.ref} label={item.label} />
          ))}
        </>,
      ),
    createReusableElement: (props: ReusableElementProps) => {
      const element = createReusableElementOfKind(props);

      return {
        render: () => renderSynchronously(element),
        renderInRenderPropSwitch: (switchLabel: string) =>
          renderSynchronously(
            <RenderPropSwitch switchLabel={switchLabel} element={element} />,
          ),
        renderWithRenderPropSibling: () =>
          renderSynchronously(
            <div>
              {element}
              <RenderPropSlot element={element} />
            </div>,
          ),
        renderWithRefReaderSibling: (onRead: (elementRef: unknown) => void) =>
          renderSynchronously(
            <div>
              {element}
              <ElementRefReader element={element} onRead={onRead} />
            </div>,
          ),
        renderClone: ({
          label,
          ...config
        }: {
          label: string;
          ref?: ReusableElementProps['ref'] | null;
        }) =>
          renderSynchronously(
            cloneElement(
              element,
              props.kind === 'host'
                ? { ...config, children: label }
                : { ...config, label },
            ),
          ),
      };
    },
    renderClass: ({
      construction,
      ...props
    }: {
      construction: 'jsx' | 'create-element' | 'clone-element' | 'forward-ref';
      label: string;
      ref?: Ref<InstanceButton>;
    }) => {
      const components = {
        jsx: <InstanceButton ref={props.ref} label={props.label} />,
        'create-element': createElement(InstanceButton, props),
        'clone-element': cloneElement(
          <InstanceButton label={props.label} />,
          props,
        ),
        'forward-ref': (
          <ForwardRefInstanceButton ref={props.ref} label={props.label} />
        ),
      };

      renderSynchronously(components[construction]);
    },
    click: (element: Element) =>
      runUpdate(() =>
        element.dispatchEvent(new MouseEvent('click', { bubbles: true })),
      ),
    renderNothing: () => renderSynchronously(null),
    unmount: () => root.unmount(),
  };
};
