## Base documentation

- Documentation: https://docs.twenty.com/developers/extend/apps/getting-started
- Rich app example: https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/fixtures/rich-app

## Common Pitfalls

- Creating an object without an index view associated. Unless this is a technical object, user will need to visualize it.
- Creating a view without a navigationMenuItem associated. This will make the view available on the left sidebar.
- Creating a front-end component that has a scroll instead of being responsive to its fixed widget height and width, unless it is specifically meant to be used in a canvas tab.
