# Frontend-only build (lighter memory footprint)
FROM node:24-alpine AS common-deps

WORKDIR /app

# Copy dependency files (need all for Nx workspace)
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches
COPY ./.prettierrc /app/
COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/

# Install ALL workspace dependencies (needed for monorepo)
RUN yarn && yarn cache clean && npx nx reset

# Build the frontend
FROM common-deps AS twenty-front-build

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared

# Disable Nx daemon to avoid issues in Docker
ENV NX_DAEMON=false

RUN npx nx build twenty-front

# Final stage - serve with nginx
FROM nginx:alpine

# Copy built frontend
COPY --from=twenty-front-build /app/packages/twenty-front/build /usr/share/nginx/html

# Copy nginx config for SPA routing
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
