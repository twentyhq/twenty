## Base documentation

- General documentation:
    - https://docs.twenty.com/developers/extend/apps/getting-started.md
    - https://docs.twenty.com/developers/extend/apps/building.md
    - https://docs.twenty.com/developers/extend/apps/data-model.md
- Specific documentation:
    - https://docs.twenty.com/developers/extend/apps/logic-functions.md
    - https://docs.twenty.com/developers/extend/apps/front-components.md
    - https://docs.twenty.com/developers/extend/apps/layout.md
- Rich app example: https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/examples/postcard

## UUID requirement

- All generated UUIDs must be valid UUID v4.

## Common Pitfalls

- Creating an object without an index view associated. Unless this is a technical object, user will need to visualize it.
- Creating a view without a navigationMenuItem associated. This will make the view available on the left sidebar.
- Creating a front-end component that has a scroll instead of being responsive to its fixed widget height and width, unless it is specifically meant to be used in a canvas tab.

## Best practice

It's highly recommended to create new app entities using `yarn twenty add`. These are the options:

| Entity type          | Command                              | Generated file                        |
| -------------------- | ------------------------------------ | ------------------------------------- |
| Object               | `yarn twenty add object`             | `src/objects/<name>.ts`               |
| Field                | `yarn twenty add field`              | `src/fields/<name>.ts`                |
| Logic function       | `yarn twenty add logicFunction`      | `src/logic-functions/<name>.ts`       |
| Front component      | `yarn twenty add frontComponent`     | `src/front-components/<name>.tsx`     |
| Role                 | `yarn twenty add role`               | `src/roles/<name>.ts`                 |
| Skill                | `yarn twenty add skill`              | `src/skills/<name>.ts`                |
| Agent                | `yarn twenty add agent`              | `src/agents/<name>.ts`                |
| View                 | `yarn twenty add view`               | `src/views/<name>.ts`                 |
| Navigation menu item | `yarn twenty add navigationMenuItem` | `src/navigation-menu-items/<name>.ts` |
| Page layout          | `yarn twenty add pageLayout`         | `src/page-layouts/<name>.ts`          |

This helps automatically generate required IDs etc.
