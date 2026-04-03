## Base documentation

- Documentation: https://docs.twenty.com/developers/extend/capabilities/apps
- Rich app example: https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/fixtures/postcard-app

## UUID requirement
- All generated UUIDs must be valid UUID v4.

## Common Pitfalls

- Creating an object without an index view associated. Unless this is a technical object, user will need to visualize it.
- Creating a view without a navigationMenuItem associated. This will make the view available on the left sidebar.
- Creating a front-end component that has a scroll instead of being responsive to its fixed widget height and width, unless it is specifically meant to be used in a canvas tab.
