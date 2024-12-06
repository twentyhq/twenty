# Before running mock-saml, read instructions on how to create public/private pair key and insert it here
# https://github.com/boxyhq/mock-saml/blob/main/.env.example
mock-saml:
	docker run \
	--name mock_saml \
  	-p 4000:4000 \
  	-e APP_URL="http://localhost:4000" \
  	-e ENTITY_ID="https://saml.example.com/entityid" \
  	-e PUBLIC_KEY= \
  	-e PRIVATE_KEY= \
  	-d boxyhq/mock-saml

smtp4dev:
	docker run \
	--name smtp4dev \
	-p 8090:80 \
	-p 2525:25 \
	-p 143:143 \
	-d rnwood/smtp4dev

webhook:
	docker compose -f ./containers/webhook.yml up --remove-orphans