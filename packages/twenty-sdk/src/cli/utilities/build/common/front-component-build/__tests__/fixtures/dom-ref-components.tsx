import { useRender } from '@base-ui/react/use-render';
import {
  Component,
  cloneElement,
  createElement,
  forwardRef,
  memo,
  type Ref,
} from 'react';
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

class InstanceButton extends Component<{ label: string }> {
  getLabel() {
    return this.props.label;
  }

  render() {
    return <button>{this.props.label}</button>;
  }
}

const RenderButton = ({ ref, renderRef, ...props }: RefButtonProps) =>
  useRender({
    render: <RefButton label={props.label} ref={renderRef} />,
    ref,
    props,
  });

type Composition =
  | 'native'
  | 'plain-function'
  | 'forward-ref'
  | 'memo'
  | 'create-element'
  | 'clone-element'
  | 'base-ui-render';

export const createDomRefFixture = (container: Element) => {
  const root = createRoot(container);

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

      root.render(components[composition]);
    },
    renderComposedRefs: (props: RefButtonProps) =>
      root.render(
        <RenderButton
          ref={props.ref}
          renderRef={props.renderRef}
          label={props.label}
        />,
      ),
    createReusableElement: (props: RefButtonProps) => {
      const element = <RefButton ref={props.ref} label={props.label} />;

      return {
        render: () => root.render(element),
        renderClone: (updatedProps: Partial<RefButtonProps>) =>
          root.render(cloneElement(element, updatedProps)),
      };
    },
    renderClass: ({
      construction,
      ...props
    }: {
      construction: 'jsx' | 'create-element' | 'clone-element';
      label: string;
      ref: Ref<InstanceButton>;
    }) => {
      const components = {
        jsx: <InstanceButton ref={props.ref} label={props.label} />,
        'create-element': createElement(InstanceButton, props),
        'clone-element': cloneElement(
          <InstanceButton label={props.label} />,
          props,
        ),
      };

      root.render(components[construction]);
    },
    unmount: () => root.unmount(),
  };
};
